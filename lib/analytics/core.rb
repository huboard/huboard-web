module Analytics
  class Core

    @adapter = LoggerAdapter.new

    class << self; attr_accessor :adapter; end

    def self.identify(payload)
      @adapter.identify(payload)
    end

    def self.track(payload)
      @adapter.track(payload)
    end
    
    def self.group(payload)
      @adapter.group(payload)
    end

    def self.page(payload)
      @adapter.page(payload)
    end
  end
end
