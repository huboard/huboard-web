require 'spec_helper'

class FakeController
  def session
    @session ||= {}
  end
  include Warden::GitHub::SSO
end

describe Warden::GitHub::SSO do
  let(:default_attrs) do
    { 'login' => 'john',
      'name' => 'John Doe',
      'gravatar_id' => '38581cb351a52002548f40f8066cfecg',
      'avatar_url' => 'http://example.com/avatar.jpg',
      'email' => 'john@doe.com',
      'company' => 'Doe, Inc.' }
  end

  let(:user) do
    Warden::GitHub::User.new(default_attrs, "the_token", "abcdefghijklmnop")
  end

  subject do
    FakeController.new
  end

  describe "warden_github_sso_session_valid?" do
    it "identifies when browsers need to be reverified" do
      subject.session[:warden_github_sso_session_verified_at] = Time.now.utc.to_i - 10
      subject.should be_warden_github_sso_session_valid(user)

      subject.session[:warden_github_sso_session_verified_at] = Time.now.utc.to_i - 300
      stub_user_session_request.to_return(:status => 204, :body => "", :headers => {})
      subject.should be_warden_github_sso_session_valid(user)

      subject.session[:warden_github_sso_session_verified_at] = Time.now.utc.to_i - 300
      stub_user_session_request.to_return(:status => 404, :body => "", :headers => {})
      subject.should_not be_warden_github_sso_session_valid(user)
    end
  end
end
