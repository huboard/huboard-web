module Saas
  class NullAnalytics
    def method_missing(*args, &block)
      self
    end
    def self.method_missing(*args, &block)
      self
    end
  end
end
