class Huboard
  class Repo
    include Assignees
    include Labels
    include Issues

    attr_accessor :user, :repo, :connection

    def initialize(user, repo, connection)
      @connection = connection
      @user = user
      @repo = repo
    end

    def gh
      @gh ||= @connection.repos(@user, @repo)
    end

    def fetch_issues
      issues
    end

    def links
      labels = link_labels
      links = []
      labels.each do |link|
        repo = Repo.new(link['user'], link['repo'], @connection)
        payload = repo.fetch false
        payload[:repo][:color] = labels.find do |l|
          link['user'] == repo.user && l['repo'] == repo.repo
        end

        links << payload
      end
      return links
    end

    def link_color(repo, link)
      return link_labels.find do |l|
        link['user'] == repo.user && l['repo'] == repo.repo
      end
    end

    def details
      gh_repos = gh
      columns = column_labels
      raise "failed to load board" if columns.empty?
      first_column = columns.first

      issues = issues().concat(closed_issues(columns.last['name'])).map do |i|
        i['current_state'] = first_column if i['current_state']['name'] == "__nil__"
        i['current_state'] = columns.find { |c| c['name'] == i['current_state']['name'] }
        i
      end

      {
        columns: columns,
        milestones: milestones,
        other_labels: other_labels.sort_by {|l| l['name'].downcase },
        link_labels: link_labels,
        assignees: assignees,
        issues: issues
      }
    end

    def fetch(with_links=true)
      repo = {
        repo: gh.to_h
      }

      repo.merge!({links: links}) if with_links

      repo
    end
  end
end
