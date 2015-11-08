module Analytics
  class Core
    def self.adapter=(adapter)
      @@adapter = adapter
      @@adapter
    end

    def self.identify(payload)
      @@adapter.identify(payload)
    end
  end
end
