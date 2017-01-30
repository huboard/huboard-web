namespace "cdn" do
  task push: :environment do
    files = Dir.glob "#{Rails.root}/public/assets/**/*"
    $stdout.puts files
  end
end
