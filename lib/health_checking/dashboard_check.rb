module HealthChecker
  class DashBoardCheck

    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end

    def checks
      @@checks
    end

    @@checks = [
      #Checks for the dashboard
    ]
    
  end
end
