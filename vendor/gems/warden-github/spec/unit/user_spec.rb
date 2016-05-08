require 'spec_helper'

describe Warden::GitHub::User do
  let(:default_attrs) do
    { 'login' => 'john',
      'name' => 'John Doe',
      'gravatar_id' => '38581cb351a52002548f40f8066cfecg',
      'avatar_url' => 'http://example.com/avatar.jpg',
      'email' => 'john@doe.com',
      'company' => 'Doe, Inc.' }
  end
  let(:token) { 'the_token' }

  let(:user) do
    described_class.new(default_attrs, token)
  end

  let(:sso_user) do
    described_class.new(default_attrs, token, "abcdefghijklmnop")
  end

  describe '#token' do
    it 'returns the token' do
      user.token.should eq token
    end
  end

  %w[login name gravatar_id avatar_url email company].each do |name|
    describe "##{name}" do
      it "returns the #{name}" do
        user.send(name).should eq default_attrs[name]
      end
    end
  end

  describe '#api' do
    it 'returns a preconfigured Octokit client for the user' do
      api = user.api

      api.should be_an Octokit::Client
      api.login.should eq user.login
      api.access_token.should eq user.token
    end
  end

  def stub_api(user, method, args, ret)
    api = double
    user.stub(:api => api)
    api.should_receive(method).with(*args).and_return(ret)
  end

  [:organization_public_member?, :organization_member?].each do |method|
    describe "##{method}" do
      context 'when user is not member' do
        it 'returns false' do
          stub_api(user, method, ['rails', user.login], false)
          user.send(method, 'rails').should be_falsey
        end
      end

      context 'when user is member' do
        it 'returns true' do
          stub_api(user, method, ['rails', user.login], true)
          user.send(method, 'rails').should be_truthy
        end
      end
    end
  end

  describe '#team_member?' do
    context 'when user is not member' do
      it 'returns false' do
        api = double()
        user.stub(:api => api)

        api.stub(:team_member?).with(123, user.login).and_return(false)

        user.should_not be_team_member(123)
      end
    end

    context 'when user is member' do
      it 'returns true' do
        api = double()
        user.stub(:api => api)
        api.stub(:team_member?).with(123, user.login).and_return(true)

        user.should be_team_member(123)
      end
    end
  end

  describe '.load' do
    it 'loads the user data from GitHub and creates an instance' do
      client = double
      attrs = {}

      Octokit::Client.
        should_receive(:new).
        with(:access_token => token).
        and_return(client)
      client.should_receive(:user).and_return(attrs)

      user = described_class.load(token)

      user.attribs.should eq attrs
      user.token.should eq token
    end
  end

  # NOTE: This always passes on MRI 1.9.3 because of ruby bug #7627.
  it 'marshals correctly' do
    Marshal.load(Marshal.dump(user)).should eq user
  end

  describe 'single sign out' do
    it "knows if the user is using single sign out" do
      user.should_not be_using_single_sign_out
      sso_user.should be_using_single_sign_out
    end

    context "browser reverification" do
      it "handles success" do
        stub_user_session_request.to_return(:status => 204, :body => "", :headers => {})
        sso_user.should be_browser_session_valid
      end

      it "handles failure" do
        stub_user_session_request.to_return(:status => 404, :body => "", :headers => {})
        sso_user.should_not be_browser_session_valid
      end

      it "handles GitHub being unavailable" do
        stub_user_session_request.to_raise(Octokit::ServerError.new)
        sso_user.should be_browser_session_valid
      end

      it "handles authentication failures" do
        stub_user_session_request.to_return(:status => 403, :body => "", :headers => {})
        sso_user.should_not be_browser_session_valid
      end
    end
  end
end
