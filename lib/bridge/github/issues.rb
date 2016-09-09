require "time"
require "hashie"

class Module
  def overridable(&blk)
    mod = Module.new(&blk)
    include mod
  end
end

class Huboard
  module Issues
    def issues(label = nil, opts={})
      params = {direction: "asc"}.merge(opts)
      params = params.merge(labels: label) if label

      issues_response = gh.issues(params).all do |request|
        request.headers["Accept"] = "application/vnd.github.cerberus-preview.full+json"
      end

      issues_response.each{
        |i| i.extend(Card)
      }.each{ |i|
        i.merge!(:repo => {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
        i[:repo][:is_collaborator] = gh['permissions'] ? gh['permissions']['push'] : nil
      }.sort_by { |i| i["_data"]["order"] || i["number"].to_f } rescue raise(Ghee::NotFound)
    end

    def archive_issue(number)
      issue = gh.issues(number)
      labels = issue.labels.all.reject {|l| Huboard.all_patterns.any? {|p| p.match l['name'] }}.sort_by {|l| l['name']}

      i = issue.extend(Card).merge!(:repo => {owner: {login: @user}, name: @repo,  full_name: "#{@user}/#{@repo}" })
      i.attach_client(connection_factory)
      i.archive(labels)
    end

    def create_issue(params)
      issue = Hashie::Mash.new params["issue"]
      issue.extend(Card).embed_data params["order"]

      milestone = issue["milestone"].nil? ? nil : issue.milestone.number
      assignee = issue["assignee"].nil? ? nil : issue.assignee.login

      labels = column_labels

      attributes = {
        title: issue.title,
        body: issue.body,
        labels: [labels.first['name']].concat((issue.labels || []).map{|l| l["name"]}),
        assignees: issue['assignees'] || [],
        milestone: milestone
      }
      attributes[:assignee] = assignee if assignee

      result = gh.issues.create(attributes) do |request|
        request.headers["Accept"] = "application/vnd.github.cerberus-preview.full+json"
      end.extend(Card).merge!(:repo => {owner: {login: @user}, name: @repo,  full_name: "#{@user}/#{@repo}" })
      result[:repo][:is_collaborator] = gh['permissions'] ? gh['permissions']['push'] : nil

      result['current_state'] = labels.first if result.current_state["name"] == "__nil__"

      result
    end

    def closed_issues(labels, since = (Time.now - 2*7*24*60*60).utc.iso8601)
      params = {state: "closed", since: since, direction: "asc", sort: "commented", per_page: 100, labels: labels}

      issues = gh.issues(params).all
      issues.each{|i| i.extend(Card)}.each{ |i|
        i.merge!(:repo => {owner: {login: user}, name: repo,  full_name: "#{user}/#{repo}" })
        i[:repo][:is_collaborator] = gh['permissions'] ? gh['permissions']['push'] : nil
      }.sort_by { |i| i["_data"]["order"] || i["number"].to_f }
    end

    def issue(number)
      raise "number is nil" unless number

      issue = gh.issues(number) do |request|
        request.headers["Accept"] = "application/vnd.github.cerberus-preview.full+json"
      end.extend(Card).merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })

      issue[:repo][:is_collaborator] = gh['permissions'] ? gh['permissions']['push'] : nil
      issue.attach_client connection_factory
      issue
    end

    def milestones
      gh.milestones.all.each { |m| m.extend(Milestone) }.each{ |i| i.merge!("repo" => {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" }) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f }
    end

    def milestone(number)
      milestone = gh.milestones(number).extend(Milestone).merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
      milestone.attach_client connection_factory
      milestone
    end

    def create_milestone(params)
      milestone = Hashie::Mash.new params["milestone"]

      milestone = gh.milestones.create({
        title: milestone.title,
        description: milestone.description,
        due_on: milestone.due_on
      }).extend(Milestone)

      milestone.attach_client connection_factory
      milestone.merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" }).reorder(milestone['number'])
    end

    module Card
      def current_state
        r = Huboard.column_pattern
        nil_label = {"name" => "__nil__"}

        begin
          column_label = self['labels'].sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}
          column_label.nil? ? 
            nil_label : 
            column_label.extend(Huboard::Labels::ColumnLabel) 
        rescue
          nil_label
        end
      end

      def order
        self["_data"]["order"] || self['number'].to_f
      end

      def update(params)
        if params["labels"]
          keep_labels = self['labels'].find_all {|l| Huboard.all_patterns.any? {|p| p.match(l['name'])}}

          update_with = params["labels"].concat(keep_labels.map{|l| l } )

          params["labels"] = update_with
        end

        patch(params).extend(Card)
      end


      def other_labels
        begin
          self['labels'].reject {|l| Huboard.all_patterns.any? {|p| p.match l['name'] }}.sort_by {|l| l['name']}
        rescue
          []
        end
      end

      def attach_client connection
        @connection_factory = connection
      end

      def gh
        @connection_factory.call
      end

      def client
        gh.repos(self[:repo][:owner][:login], self[:repo][:name]).issues(self['number'])
      end

      def events
        client.events.all
      end

      def all_comments
        client.comments.all.to_a
      end

      def feed
        the_feed =  { :comments => self.all_comments, :events => events }
        self.merge! the_feed
      end

      def activities
        the_feed =  { :comments => self.all_comments, :events => events }
        self.merge! :activities => the_feed
      end

      def patch(hash)
        hash["labels"] = hash["labels"].map {|l| l["name"] } if hash["labels"]
        updated = client.patch hash
        updated.extend(Card).merge!(:repo => self[:repo])
      end

      overridable do
        def move(index, order=nil, moved = false, opts={})
          board = Huboard::Board.new(self[:repo][:owner][:login], self[:repo][:name], @connection_factory)
          column_labels = board.column_labels
          self.labels = [] if self['labels'].nil?
          self['labels'] = self['labels'].delete_if { |l| Huboard.column_pattern.match l['name'] }
          regex = /#{index}\s*- *.+/ # TODO what does this regex do?
          new_state = column_labels.find { |l| regex.match l['name'] }
          self['labels'] << new_state unless new_state.nil?
          embed_data({"order" => order.to_f}) if order
          embed_data({"custom_state" => ""}) if moved
          opts.merge!({"labels" => self['labels'], "body" => self['body']})
          patch opts
        end
      end

      def close
        patch state: "closed"
      end

      def open
        patch state: "open"
      end

      def reorder(index)
        embed_data({"order" => index.to_f, "custom_state" => ""})

        patch body: self['body']
      end

      %w{blocked ready}.each do |method|
        define_method method do
          label_as_marked(method)
          embed_data({"custom_state" => method})

          reverse_label = method == 'blocked' ? 'ready' : 'blocked'
          self['labels'].delete_if{|l| l['name'].downcase == reverse_label}
          patch body: self['body'], labels: self['labels']
        end

        define_method "un#{method}" do
          embed_data({"custom_state" => ""})

          self['labels'].delete_if{|l| l['name'].downcase == method}
          patch body: self['body'], labels: self['labels']
        end
      end

      def label_as_marked(label)
        board = Huboard::Board.new(self[:repo][:owner][:login], self[:repo][:name], @connection_factory)
        if board.other_labels.any?{|l| l['name'].downcase == label}
          self['labels'].push({'name' => label})
        end
      end

      def archive(labels)
        embed_data({"custom_state" => "archived"})

        patch({body: self['body'], labels: labels})
      end

      def embed_data(data = nil)
        r = /@huboard:(.*)/
        if !data
          match = r.match(self['body'] || "")
          return { order: self['number'], milestone_order: self['number'] } if match.nil?

          begin
            data = MultiJson.load(match[1])
            data["order"] = self['number'] unless data["order"]

            zero_adjustment = 0.1e-20
            if !data["order"].is_a?(Numeric) || data["order"] <= 0
              data["order"] = self['id'] * zero_adjustment
              data["zero_fix"] = true
              self['body'] = self['body'].to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(data)}"
            end

            data["milestone_order"] = self['number'] unless data["milestone_order"]
            if !data["milestone_order"].is_a?(Numeric) || data["milestone_order"] <= 0
              data["milestone_order"] = self['id'] * zero_adjustment
              data["zero_fix"] = true
              self['body'] = self['body'].to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(data)}"
            end

            return data
          rescue
            return { order: self['number'], milestone_order: self['number'] }
          end
        else
          _data = embed_data
          if r.match self['body']
            self['body'] = self['body'].to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(_data.merge(data))}"
          else
            self['body'] = self['body'].to_s.concat  "\r\n\r\n<!---\r\n@huboard:#{MultiJson.dump(data)}\r\n-->\r\n" 
          end
        end
      end

      def number_searchable
        self['number'].to_s
      end

      def self.extended(klass)
        klass['current_state'] = klass.current_state
        klass['number_searchable'] = klass.number_searchable
        klass['other_labels'] = klass.other_labels
        klass['_data'] = klass.embed_data
      end

      def add_assignees(assignees)
        issue = client.assignees.add(assignees)
        issue.extend(Card).merge!(:repo => self[:repo])
        issue
      end

      def remove_assignees(assignees)
        issue = client.assignees.remove(assignees)
        issue.extend(Card).merge!(:repo => self[:repo])
        issue
      end
    end

    module Milestone
      def reorder(index)
        embed_data({"order" => index.to_f})

        patch :description => self['description']
      end

      def attach_client connection
        @connection_factory = connection
      end

      def gh
        @connection_factory.call
      end

      def client
        gh.repos(self[:repo][:owner][:login], self[:repo][:name]).milestones(self['number'])
      end

      def patch(hash)
        m = client.patch hash
        m.extend(Milestone).merge! :repo => self[:repo]
      end

      def embed_data(data = nil)
        r = /@huboard:(.*)/
        if !data
          match = r.match(self['description'] || "")
          return { order: self['number'] } if match.nil?

          begin
            data = MultiJson.load(match[1])
            data["order"] = self['number'] unless data["order"]
            return data
          rescue
            return { order: self['number'] }
          end
        else
          _data = embed_data
          if r.match self['description']
            self['description'] = self['description'].to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(_data.merge(data))}"
          else
            self['description'] = self['description'].to_s.concat  "\r\n\r\n<!---\r\n@huboard:#{MultiJson.dump(data)}\r\n-->\r\n" 
          end
        end
      end

      def self.extended(klass)
        klass["_data"] = klass.embed_data
      end
    end
  end
end
