require 'spec_helper'

describe 'OAuth' do
  let(:code) { '1234' }

  def stub_code_for_token_exchange(answer='access_token=the_token')
    stub_request(:post, 'https://github.com/login/oauth/access_token').
      with(:body => hash_including(:code => code)).
      to_return(:status => 200, :body => answer)
  end

  def stub_user_retrieval
    stub_request(:get, 'https://api.github.com/user').
      with(:headers => { 'Authorization' => 'token the_token' }).
      to_return(
        :status => 200,
        :body => File.read('spec/fixtures/user.json'),
        :headers => { 'Content-Type' => 'application/json; charset=utf-8' })
  end

  def redirect_uri(response)
    Addressable::URI.parse(response.headers['Location'])
  end

  context 'when accessing a protected url' do
    it 'redirects to GitHub for authentication' do
      unauthenticated_response = get '/profile'
      github_uri = redirect_uri(unauthenticated_response)

      github_uri.scheme.should eq 'https'
      github_uri.host.should eq 'github.com'
      github_uri.path.should eq '/login/oauth/authorize'
      github_uri.query_values['client_id'].should =~ /\w+/
      github_uri.query_values['state'].should =~ /\w+/
      github_uri.query_values['redirect_uri'].should =~ /^http.*\/profile$/
    end
  end

  context 'when redirected back from GitHub' do
    it 'exchanges the code for an access token' do
      stub_code_for_token_exchange
      stub_user_retrieval

      unauthenticated_response = get '/login'
      github_uri = redirect_uri(unauthenticated_response)
      state = github_uri.query_values['state']

      get "/login?code=#{code}&state=#{state}"
    end

    context 'and the returned state does not match the initial state' do
      it 'fails authentication' do
        get '/login'
        response = get "/login?code=#{code}&state=foobar"

        response.should_not be_successful
        response.body.should include 'State mismatch'
      end
    end

    context 'and GitHub rejects the code while exchanging it for an access token' do
      it 'fails authentication' do
        stub_code_for_token_exchange('error=bad_verification_code')

        unauthenticated_response = get '/login'
        github_uri = redirect_uri(unauthenticated_response)
        state = github_uri.query_values['state']
        response = get "/login?code=#{code}&state=#{state}"

        response.should_not be_successful
        response.body.should include 'Bad verification code'
      end
    end

    context 'and the user denied access' do
      it 'fails authentication' do
        unauthenticated_response = get '/login'
        github_uri = redirect_uri(unauthenticated_response)
        state = github_uri.query_values['state']
        response = get "/login?error=access_denied&state=#{state}"

        response.should_not be_successful
        response.body.should include 'access denied'
      end
    end

    context 'and code was exchanged for an access token' do
      it 'redirects back to the original path' do
        stub_code_for_token_exchange
        stub_user_retrieval

        unauthenticated_response = get '/profile?foo=bar'
        github_uri = redirect_uri(unauthenticated_response)
        state = github_uri.query_values['state']

        callback_response = get "/profile?code=#{code}&state=#{state}"
        authenticated_uri = redirect_uri(callback_response)

        authenticated_uri.path.should eq '/profile'
        authenticated_uri.query.should eq 'foo=bar'
      end
    end

    context 'with GitHub SSO and code was exchanged for an access token' do
      it 'redirects back to the original path' do
        stub_code_for_token_exchange
        stub_user_retrieval

        unauthenticated_response = get '/profile?foo=bar'
        github_uri = redirect_uri(unauthenticated_response)
        state = github_uri.query_values['state']

        callback_response = get "/profile?code=#{code}&state=#{state}&browser_session_id=abcdefghijklmnop"
        authenticated_uri = redirect_uri(callback_response)

        authenticated_uri.path.should eq '/profile'
        authenticated_uri.query.should eq 'foo=bar'
      end
    end
  end

  context 'when not inside OAuth flow' do
    it 'does not recognize a seeming callback url as an actual callback' do
      response = get '/profile?state=foo&code=bar'

      a_request(:post, 'https://github.com/login/oauth/access_token').
        should have_not_been_made
    end
  end

  context 'when already authenticated' do
    it 'does not perform the OAuth flow again' do
      stub_code_for_token_exchange
      stub_user_retrieval

      unauthenticated_response = get '/login'
      github_uri = redirect_uri(unauthenticated_response)
      state = github_uri.query_values['state']

      callback_response = get "/login?code=#{code}&state=#{state}"
      authenticated_uri = redirect_uri(callback_response)
      get authenticated_uri.path
      logged_in_response = get '/login'

      redirect_uri(logged_in_response).path.should eq '/'
    end
  end
end
