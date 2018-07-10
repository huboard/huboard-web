namespace "cdn" do
  task push: :environment do
    assets_dir = "#{Rails.root}/public/assets"
    `gsutil -m rm gs://huboard-web/staging/assets/**`
    `gsutil -m cp -r #{assets_dir} gs://huboard-web/staging`
    `gsutil -m acl -R ch -u AllUsers:R gs://huboard-web/staging/assets`
  end
end
