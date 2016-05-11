require 'test_helper'
class UserTest < ActiveSupport::TestCase

  def setup
    @attribs = {id: 123, login: 'bert', name: 'Burt Reynolds', gravatar_id: '12134', avatar_url: 'herp.png', email: 'support@microsoft.com', site_admin: false }

    @warden_user = Warden::GitHub::User.new @attribs, "the_token", "user,repo"

    @user = User.new @warden_user

  end
  test "should delegate scope to warden user methods" do
   %w{ token scope attribs id login name }.each do |name|
     assert_respond_to @user, name.to_sym 
   end
  end
  test "should have scope user" do 
    assert @user.has_scope?(:user), "doesn't have user scope"
  end
  test "should not have scope derp" do
    assert_not @user.has_scope?(:derp), "false postive"
  end
end
