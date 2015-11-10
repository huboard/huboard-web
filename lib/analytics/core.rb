module Analytics
  class Core
    class << self; attr_accessor :adapter; end

    def self.identify(payload)
      @adapter.identify(payload)
    end

    def self.track(payload)
      @adapter.track(payload)
    end
  end
end
