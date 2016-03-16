$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "saas/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "saas"
  s.version     = Saas::VERSION
  s.authors     = [""]
  s.email       = [""]
  s.homepage    = "https://huboard.com"
  s.summary     = "A simple, lightweight kanban board for GitHub"
  s.description = "Saas Module for HuBoard"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.2.4"
  s.add_dependency 'analytics-ruby'
end
