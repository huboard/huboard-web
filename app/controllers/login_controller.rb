class LoginController < ApplicationController
  layout false
  def logout
    request.env['warden'].logout 
    redirect_to "/"
  end
  def public
    github_authenticate! :public
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/"
  end
  def private
    github_authenticate! :private
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/"
  end

  def github_login
    github_authenticate! :default
  end

  def github_login_callback
    puts ">>>>>>>>>>>>>>"
    puts ">>>>>>>>>>>>>>"
    puts current_user.id
    puts ">>>>>>>>>>>>>>"
    puts ">>>>>>>>>>>>>>"
  end
end
