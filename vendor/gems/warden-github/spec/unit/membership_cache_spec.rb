require 'spec_helper'

describe Warden::GitHub::MembershipCache do
  describe '#fetch_membership' do
    it 'returns false by default' do
      cache = described_class.new({})
      cache.fetch_membership('foo', 'bar').should be_falsey
    end

    context 'when cache valid' do
      let(:cache) do
        described_class.new('foo' => {
          'bar' => Time.now.to_i - described_class::CACHE_TIMEOUT + 5
        })
      end

      it 'returns true' do
        cache.fetch_membership('foo', 'bar').should be_truthy
      end

      it 'does not invoke the block' do
        expect { |b| cache.fetch_membership('foo', 'bar', &b) }.
          to_not yield_control
      end
    end

    context 'when cache expired' do
      let(:cache) do
        described_class.new('foo' => {
          'bar' => Time.now.to_i - described_class::CACHE_TIMEOUT - 5
        })
      end

      context 'when no block given' do
        it 'returns false' do
          cache.fetch_membership('foo', 'bar').should be_falsey
        end
      end

      it 'invokes the block' do
        expect { |b| cache.fetch_membership('foo', 'bar', &b) }.
          to yield_control
      end
    end

    it 'caches the value when block returns true' do
      cache = described_class.new({})
      cache.fetch_membership('foo', 'bar') { true }
      cache.fetch_membership('foo', 'bar').should be_truthy
    end

    it 'does not cache the value when block returns false' do
      cache = described_class.new({})
      cache.fetch_membership('foo', 'bar') { false }
      cache.fetch_membership('foo', 'bar').should be_falsey
    end
  end

  it 'uses the hash that is passed to the initializer as storage' do
    time = Time.now.to_i
    hash = {
      'foo' => {
        'valid' => time,
        'timedout' => time - described_class::CACHE_TIMEOUT - 5
      }
    }
    cache = described_class.new(hash)

    # Verify that existing data in the hash is used:
    expect(cache.fetch_membership('foo', 'valid')).to be_true
    expect(cache.fetch_membership('foo', 'timedout')).to be_false

    # Add new data to the hash:
    cache.fetch_membership('foo', 'new') { true }
    cache.fetch_membership('foo', 'false') { false }

    # Verify the final hash state:
    expect(hash).to eq('foo' => {
      'valid' => time,
      'new' => time
    })
  end
end
