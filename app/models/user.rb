class User
  ATTRIBUTES = %w[id login name gravatar_id avatar_url email company site_admin].freeze

  extend Forwardable

  attr_reader :warden

  def initialize(warden_user)
    @warden = warden_user
  end

  def has_scope?(scope)
    (self.scope || "").empty? ? false : self.scope.split(',').include?(scope.to_s)
  end

  def_delegators :@warden, :token, :scope, :attribs, :safe_avatar_url

  ATTRIBUTES.each do |name|
    def_delegator :@warden, name.to_sym
  end

end
