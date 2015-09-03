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
      link_labels.map do |link|
        Repo.new(link['user'], link['repo'], @connection).fetch false
      end
    end

    def details
      gh_repos = gh
      columns = column_labels
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
