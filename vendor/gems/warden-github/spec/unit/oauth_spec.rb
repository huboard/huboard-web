require 'spec_helper'

describe Warden::GitHub::OAuth do
  let(:default_attrs) do
    { :state => 'abc',
      :client_id => 'foo',
      :client_secret => 'bar',
      :redirect_uri => 'http://example.com/callback' }
  end

  def oauth(attrs=default_attrs)
    described_class.new(attrs)
  end

  describe '#authorize_uri' do
    it 'contains the base uri' do
      oauth.authorize_uri.to_s.should \
        include Octokit.web_endpoint
    end

    %w[ client_id state redirect_uri ].each do |name|
      it "contains the correct #{name} param" do
        uri = Addressable::URI.parse(oauth.authorize_uri)

        uri.query_values[name].should eq default_attrs[name.to_sym]
      end
    end

    { :nil => nil, :empty => '' }.each do |desc, value|
      it "does not contain the scope param if #{desc}" do
        uri = oauth(default_attrs.merge(:scope => value)).authorize_uri

        uri.to_s.should_not include 'scope'
      end
    end
  end

  describe '#access_token' do
    def expect_request(attrs={})
      stub_request(:post, %r{\/login\/oauth\/access_token$}).
        with(:body => hash_including(attrs.fetch(:params, {}))).
        to_return(:status => 200,
                  :body => attrs.fetch(:answer, 'access_token=foobar'))
    end

    it 'exchanges the code for an access token' do
      expect_request(:answer => 'access_token=the_token&token_type=bearer')

      oauth.access_token.should eq 'the_token'
    end

    it 'raises BadVerificationCode if no access token is returned' do
      expect_request(:answer => 'error=bad_verification_code')

      expect { oauth.access_token }.
        to raise_error(described_class::BadVerificationCode)
    end

    %w[ client_id client_secret code ].each do |name|
      it "performs a request containing the correct #{name} param" do
        oauth(default_attrs.merge(:code => 'the_code')).tap do |o|
          expect_request(:params => { name => o.send(name) })
          o.access_token
        end
      end
    end
  end
end
