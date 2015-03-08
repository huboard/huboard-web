class CreateGithubCacheTable < ActiveRecord::Migration
  def change
    create_table :github_responses do |t|
      t.string :owner
      t.string :repo
      t.string :identifier
      t.string :type
      t.jsonb :payload

      t.timestamps null:false
    end
  end
end
