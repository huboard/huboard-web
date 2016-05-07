# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
Rails.application.config.assets.paths << Rails.root.join("ember-app", "dist", "assets")
Rails.application.config.assets.paths << Rails.root.join("ember-accounts", "dist", "assets")
Rails.application.config.assets.precompile += %w( app.js vendor.js )

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
Rails.application.config.assets.precompile += %w( ember-accounts.js ember-accounts.css vendor-accounts.js flex_layout.css marketing.js marketing/main.css vendor/jquery.js bootstrap.css bootstrap.js board/application.js vendor/jquery-ui.js )

Rails.application.config.assets.precompile += %w( errors/main.css )

precompile_whitelist = %w(
  .html .erb .haml
  .png  .jpg .gif .jpeg .ico
  .eot  .otf .svc .woff .ttf
  .svg
)
Rails.application.config.assets.precompile.shift
Rails.application.config.assets.precompile.unshift -> (path) {
  (extension = File.extname(path)).present? and extension.in?(precompile_whitelist)
}
