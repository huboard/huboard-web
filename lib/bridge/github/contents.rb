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
        template = issue_template
        content = Base64.decode64(template['content']) if template
      rescue => e
        ::Raygun.track_exception(e, custom_data: {error_response: template.to_s})
        content = nil
      end

      return content ? content.force_encoding("utf-8") : content
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
