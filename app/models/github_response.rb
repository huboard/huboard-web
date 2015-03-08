# == Schema Information
#
# Table name: github_responses
#
#  id         :integer          not null, primary key
#  owner      :string
#  repo       :string
#  identifier :string
#  type       :string
#  payload    :jsonb
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class GithubResponse < ActiveRecord::Base
end
