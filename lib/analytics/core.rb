module Analytics
  class Core
    class << self; attr_accessor :adapter; end

    def self.identify(payload)
      @adapter.identify(payload)
    end
  end
end
