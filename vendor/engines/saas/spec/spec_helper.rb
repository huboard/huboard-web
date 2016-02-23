#Simple Spec Helper for libs specs in the engine (no Rails context)

#Mailer
blacklist = [/saas\.rb/, /engine\.rb/, /before_action\.rb/]
Dir.chdir(File.expand_path("lib/."))
Dir.glob("**/*.rb").each do |file|
  next if blacklist.any? do |pattern|
    file =~ pattern 
  end
  require_relative "../lib/#{file}"
end
