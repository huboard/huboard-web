class Huboard
  module Contents
    ISSUE_TEMPLATE_PATTERN = /^ISSUE_TEMPLATE\.(md|txt)/i

    def issue_template
      find_file = lambda {|list| list.find {|f| ISSUE_TEMPLATE_PATTERN.match(f['name'])} }

      file_list = gh.contents ''
      return find_file.call(file_list) if file_list && file_list.size > 0

      file_list = gh.contents '.github'
      return find_file.call(file_list) if file_list && file_list.size > 0
    end
  end
end
