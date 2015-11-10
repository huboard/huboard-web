if ENV["SEGMENTIO_KEY"]
  Analytics::Core.adapter = Segment::Analytics.new({
    write_key: ENV["SEGMENTIO_KEY"]
  })
end
