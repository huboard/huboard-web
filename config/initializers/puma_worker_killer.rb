PumaWorkerKiller.config do |config|
  config.ram = ENV['DYNO_MAX_MEMORY'].nil? ? 512 : ENV['DYNO_MAX_MEMORY'].to_i
  config.percent_usage = 0.9
end
PumaWorkerKiller.enable_rolling_restart if ENV['DYNO'] 
