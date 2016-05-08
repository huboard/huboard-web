# -*- encoding: utf-8 -*-
require File.expand_path('../lib/warden/github/version', __FILE__)

Gem::Specification.new do |s|
  s.name        = "warden-github"
  s.version     = Warden::GitHub::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Corey Donohoe"]
  s.email       = ["atmos@atmos.org"]
  s.homepage    = "http://github.com/atmos/warden-github"
  s.summary     = "A warden strategy for easy oauth integration with github"
  s.license     = 'MIT'
  s.description = s.summary

  s.rubyforge_project = "warden-github"

  s.add_dependency "warden",        ">1.0"
  s.add_dependency "octokit",       ">2.1.0"
  s.add_dependency "activesupport", ">3.0"

  s.add_development_dependency "rack",      "~>1.4.1"
  s.add_development_dependency "rake"
  s.add_development_dependency "rspec",     "~>2.8"
  s.add_development_dependency "simplecov"
  s.add_development_dependency "webmock",   "~>1.9"
  s.add_development_dependency "sinatra"
  s.add_development_dependency "shotgun"
  s.add_development_dependency "addressable", ">2.2.0"
  s.add_development_dependency "rack-test",   "~>0.5.3"
  s.add_development_dependency "yajl-ruby"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
