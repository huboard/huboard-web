module Queries
  class CouchUser

    def self.get(id, connection)
      -> { connection.users.findById(id) }
    end
  end
end
