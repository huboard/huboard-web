class Huboard
  module Hooks

    def hooks
      return [] unless ENV['GITHUB_WEBHOOK_ENDPOINT']
      url = ENV['GITHUB_WEBHOOK_ENDPOINT']
      hooks = gh.hooks.all.select do |h| 
        h['config'] && h['config']['url'] && h['config']['url'].downcase.start_with?(url.downcase) 
      end
      hooks
    end

    def delete_hook(id)
      gh.hooks(id).destroy
    end

    def hooks_exist?
      url = ENV['GITHUB_WEBHOOK_ENDPOINT'] || ""
      urls = hooks.map {|x| x['url'].downcase }
      expected = ['webhook/issue', 'webhook/issue_comment'].map {|x| File.join(url, x) }
      return urls & expected == urls
    end

    ['issues', 'issue_comment', 'pull_request'].each do |event_name|
      define_method "create_#{event_name}_hook" do
        url = ENV['GITHUB_WEBHOOK_ENDPOINT']
        gh.hooks.create(
          {
            name: 'web',
            config: {
              url: File.join(url, 'webhook', event_name),
              insecure_ssl: ENV['HUBOARD_ENV'] != 'production' ? "1" : "0"
            },
            events: [
              event_name
            ],
            active: true,
          }
        )
      end

      define_method "hook_#{event_name}_exist?" do
        url = ENV['GITHUB_WEBHOOK_ENDPOINT']
        hook_url = File.join(url, 'webhook', event_name).downcase
        hooks.map { |x| x['config']['url'].downcase }.include? hook_url
      end
    end

    def create_hooks 
      return if hooks.any? || ENV['GITHUB_WEBHOOK_ENDPOINT'].nil?

      url = ENV['GITHUB_WEBHOOK_ENDPOINT']

      ['issues', 'issue_comment', 'pull_request'].each do |event_name|
        self.send("create_#{event_name}_hook")
      end
    end
  end
end
