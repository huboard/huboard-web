module Api
  class LinksController < ApiController
    def index
      repo = gh.repos params[:user], params[:repo]
      not_found unless repo['permissions'] && repo['permissions']['push']

      board = huboard.board(params[:user], params[:repo])
      links = board.link_labels.map do |label|
        {
          label: label,
          columns: huboard.board(label['user'], label['repo']).column_labels
        }
      end
      render json: links 
    end
    def create
      board = huboard.board(params[:user], params[:repo])
      link = board.create_link(params[:link], params[:labels])
      if link
       repo = huboard.repo(link['user'], link['repo']).fetch(false)
       repo[:repo][:color] = link
       render json: repo
      else
        raise HuBoard::Error, "Unable to link #{params[:link]} to your repository"
      end
    end
    def destroy
      board = huboard.board(params[:user], params[:repo])
      link = board.destroy_link params[:link]
      render json: {
        status: link 
      }
    end
    def update
      board = huboard.board(params[:user], params[:repo])
      link = board.update_link params[:name], params[:labels]
      if link
       repo = huboard.repo(link['user'], link['repo']).details({issue_filter: params[:labels]})
       render json: {data: repo}
      else
        raise HuBoard::Error, "Unable to update link #{params[:name]}"
      end
    end

    def validate
      repo = params[:link].split("/")
      board = huboard.board(repo[0], repo[1])

      unless board.repo_exists?
        return render json: {
          message: "Could not find repo: #{params[:link]}"
        }, status: 400
      end
      unless board.issues_enabled?
        return render json: {
          message: "Please enable GitHub issues for #{params[:link]}!"
        }, status: 403
      end

      render json: { link: params[:link], other_labels: board.other_labels }, status: 200
    end
  end
end
