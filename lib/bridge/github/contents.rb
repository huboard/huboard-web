class Huboard
  module Contents
    ISSUE_TEMPLATE_PATTERN = /^ISSUE_TEMPLATE\.(md|txt)$/i
    ISSUE_TEMPLATE_DIRS = ['.github']

    def issue_template
      file_list = gh.contents ''
      template = find_template(file_list)

      template || ISSUE_TEMPLATE_DIRS.find do |dir|
        template = find_template(gh.contents dir) if file_list && file_list.any?{|f| f['name'] == dir }
        return template
      end
    end

    def issue_template_content
      template = issue_template
      return template ? Base64.decode64(template['content']) : nil
    end

    :private
    def find_template(list)
      if list && list.size > 0 && list.first != ["message", "This repository is empty."]
        file = list.find {|f| ISSUE_TEMPLATE_PATTERN.match(f['name'])}
        return gh.contents file['path'] if file
      end

      nil
    end
  end
end
