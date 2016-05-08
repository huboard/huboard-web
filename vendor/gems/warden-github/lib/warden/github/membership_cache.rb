module Warden
  module GitHub
    # A hash subclass that acts as a cache for organization and team
    # membership states. Only membership states that are true are cached. These
    # are invalidated after a certain time.
    class MembershipCache
      CACHE_TIMEOUT = 60 * 5

      def initialize(data)
        @data = data
      end

      # Fetches a membership status by type and id (e.g. 'org', 'my_company')
      # from cache. If no cached value is present or if the cached value
      # expired, the block will be invoked and the return value, if true,
      # cached for e certain time.
      def fetch_membership(type, id)
        type = type.to_s
        id = id.to_s if id.is_a?(Symbol)

        if cached_membership_valid?(type, id)
          true
        elsif block_given? && yield
          cache_membership(type, id)
          true
        else
          false
        end
      end

      private

      def cached_membership_valid?(type, id)
        timestamp = @data.fetch(type).fetch(id)

        if Time.now.to_i > timestamp + CACHE_TIMEOUT
          @data.fetch(type).delete(id)
          false
        else
          true
        end
      rescue IndexError
        false
      end

      def cache_membership(type, id)
        hash = @data[type] ||= {}
        hash[id] = Time.now.to_i
      end
    end
  end
end
