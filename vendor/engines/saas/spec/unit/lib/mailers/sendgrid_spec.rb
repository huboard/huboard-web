require 'spec_helper'

describe Saas::Mailers::Sendgrid do

  let(:sut) { Saas::Mailers::Sendgrid }
  let(:config) {{ api_key: 'abc1234' }}

  class MockClient
    def initialize(config); end
    def send(mail); end
  end
  class MockMail
    attr_accessor :template
    def initialize(mail_config); end
  end
  class MockTemplate
    def initialize(template); end
  end

  before(:each) do
    stub_const("SendGrid::Client", MockClient)
    stub_const("SendGrid::Mail", MockMail)
    stub_const("SendGrid::Template", MockTemplate)
  end

  context 'set configuration' do

    it 'is configurable' do
      adapter = sut.new(config)
      expect(adapter.api_key).to equal config[:api_key]
    end

    it 'throws if missing api key' do
      expect{ sut.new({}) }.to raise_error(RuntimeError, "Saas::Mailers::Sendgrid missing api_key")
    end
  end

  context 'sending emails' do

    let(:adapter) { sut.new(config) }
    let(:mail){{ subject: "Hu", body: "Dat" }}

    it 'sends emails' do
      expect_any_instance_of(MockClient).to receive(:send)
      adapter.send_mail(mail)
    end

    it 'creates an instance for templates' do
      mail[:template] = 'abc1234'
      expect(MockTemplate).to receive(:new).with(mail[:template])
      adapter.send_mail(mail)
    end
  end
end
