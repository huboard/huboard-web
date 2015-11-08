if ENV["ANALYTICS_KEY"]
  Analytics::Core.adapter = Segment::Analytics.new({
    write_key: ENV["ANALYTICS_KEY"]
  })
end
