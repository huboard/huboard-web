class Huboard
  module Contents
    ISSUE_TEMPLATE_PATTERN = /^ISSUE_TEMPLATE\.(md|txt)$/i
    ISSUE_TEMPLATE_DIRS = ['.github']

    def issue_template
      file_list = gh.contents ''
      template = find_template(file_list)

      template || ISSUE_TEMPLATE_DIRS.find do |dir|
        template = find_template(gh.contents dir) if file_list.is_a?(Array) && file_list.any?{|f| f['name'] == dir }
        return template if template
        false
      end
    end

    def issue_template_content
      begin
        template = Base64.decode64(issue_template['content'])
      rescue => e
        ::Raygun.track_exception(e, custom_data: {error_response: template.to_s})
        template = nil
      end

      return template
    end

    :private
    def find_template(list)
      if list.is_a?(Array) && list.size > 0
        file = list.find {|f| ISSUE_TEMPLATE_PATTERN.match(f['name'])}
        return gh.contents file['path'] if file
      end

      nil
    end
  end
end
