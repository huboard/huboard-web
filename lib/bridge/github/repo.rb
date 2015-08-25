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

    def fetch(with_links=true)
      repo = {
        owner: @connection.users(@user),
        repo: gh.to_h,
        labels: other_labels.sort_by {|l| l['name'].downcase },
        assignees: assignees,
        milestones: milestones,
      }

      repo.merge!({links: links}) if with_links

      repo
    end
  end
end
