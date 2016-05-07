module Analytics
  class LoggerAdapter
    def method_missing(*args, &block)
      Rails.logger.info args
    end
  end
end
