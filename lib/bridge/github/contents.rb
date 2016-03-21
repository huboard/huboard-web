class Huboard
  module Contents
      ISSUE_TEMPLATE_PATTERN = /ISSUE_TEMPLATE\.(md|txt)/

      def issue_template
      root = gh.contents ''
      return root.find {|e| issue_template_pattern.match(e.name)} if root && root.kind_of?(Array)

      github = gh.contents '.github'
      return github.find {|e| issue_template_pattern.match(e.name)} if github && github.kind_of?(Array)
    end
  end
end
