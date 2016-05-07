require "active_support/core_ext/numeric/time"
require_relative "github/repos"
require_relative "github/assignees"
require_relative "github/labels"
require_relative "github/settings"
require_relative "github/issues"
require_relative "github/backlog"
require_relative "github/hooks"
require_relative "github/board"
require_relative "github/user"
require_relative "github/comments"
require_relative "github/commits"
require_relative "github/contents"
require_relative "github/repo"
require_relative "middleware"
require "addressable/uri"

class Huboard
  def self.wip_pattern
    /(?<all>\s{1}<=\s+(?<wip>\d+)$)/
  end

  def self.column_pattern
    /(^|\:\s{1})(?<id>\d+) *- *(?<name>.+)/
  end

  def self.link_pattern
    /^Link <=> (?<user_name>.*)\/(?<repo>[^\/?\ ]*)($|(.*)\=(?<labels>.*))/
  end

  def self.settings_pattern
    /^@huboard:(.*)/
  end

  def self.all_patterns
    [self.column_pattern, self.link_pattern, self.settings_pattern]
  end

  class Client
    def initialize(access_token, params={})
      @connection_factory = ->(token = nil) {
        options = {access_token: token || access_token}
        options = {} if(token.nil? && access_token.nil?)
        options[:api_url] = ENV["GITHUB_API_ENDPOINT"] if ENV["GITHUB_API_ENDPOINT"]

        Ghee.new(options) do |conn|
          conn.request :retry, max: 4,
                               exceptions: [
                                 Errno::ETIMEDOUT,
                                 'Timeout::Error',
                                 Faraday::TimeoutError,
                                 Faraday::ConnectionFailed,
                                ]
          conn.use ClientId, params unless token || access_token
          conn.use Mimetype
          #conn.response :logger
          # disable cache because github api is broken
          conn.use Caching

        end
      }
    end

    def connection
      @connection_factory.call
    end

    def board(user, repo)
      Board.new(user, repo, @connection_factory)
    end

    def repo(user, repo)
      Repo.new(user, repo, connection)
    end
  end

  class Board
    include Assignees
    include Labels
    include Settings
    include Issues
    include Backlog
    include Hooks
    include Comments
    include Commits
    include Contents
  end
end
