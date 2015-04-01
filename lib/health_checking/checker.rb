module HealthChecking
  class Checker

    attr_reader :interface, :payload
    def initialize(interface)
      @payload = []
      @interface = interface 
    end

    def check
      checks.each do |check|
        @payload << check.perform(@interface.deps)
      end
      @payload
    end

    def checks
      @interface.checks
    end
  end
end
