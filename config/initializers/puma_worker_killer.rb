PumaWorkerKiller.config do |config|
  config.ram = 1024
  config.percent_usage = 0.9
end
PumaWorkerKiller.enable_rolling_restart if ENV['DYNO'] 
