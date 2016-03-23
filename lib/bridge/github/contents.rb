class Huboard
  module Contents
    ISSUE_TEMPLATE_PATTERN = /^ISSUE_TEMPLATE\.(md|txt)/i

    def issue_template
      file_list = gh.contents ''
      return find_template(file_list) if file_list && file_list.size > 0

      file_list = gh.contents '.github'
      return find_template(file_list) if file_list && file_list.size > 0
    end

    :private
    def find_template(list)
      issue = list.find {|f| ISSUE_TEMPLATE_PATTERN.match(f['name'])}
      return gh.contents issue['path'] if issue
    end
  end
end
