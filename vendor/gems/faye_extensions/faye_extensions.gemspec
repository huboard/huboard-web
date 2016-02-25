$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "faye_extensions/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "faye_extensions"
  s.version     = FayeExtensions::VERSION
  s.authors     = [""]
  s.email       = [""]
  s.homepage    = "https://github.com/huboard/huboard-web/tree/master/vendor/gems/faye_extensions"
  s.summary     = "HuBoard Extensions for Faye"
  s.description = "HuBoard Extensions for Faye"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.2.0"
end
