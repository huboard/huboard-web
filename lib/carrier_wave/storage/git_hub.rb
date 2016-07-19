module CarrierWave
  module Storage
    class GitHub < File

      def store!(file)
        repo = gh.repos(@uploader.user, @uploader.repo) 

        #create a blob with the image contents
        #
        blob = repo.git.blobs.create({
          :content => Base64.encode64(file.read),
          :encoding => "base64"
        })

        blob_sha = blob["sha"]

        upload_path = "#{blob_sha[0,2]}/#{blob_sha[2,32]}/#{SecureRandom.uuid}#{::File.extname file.original_filename}"

        #get the hidden ref to see if we have a base tree
        ref = repo.git.refs("huboard/uploads").raw

        #if we can't find the ref
        if(ref.status != 200)
          #create a tree pointing to nothing
          tree = repo.git.trees.create({ tree: [{
              path: upload_path,
              mode: '100644',
              type: 'blob',
              sha: blob["sha"]
            }]
          })

          #create a new commit
          commit = repo.git.commits.create({ tree: tree["sha"], message: "uploading #{upload_path}" })

          #create a ref
          ref = repo.git.refs.create({
            ref: "refs/huboard/uploads",
            sha: commit["sha"]
          })
        else
          parent_commit = ref.body["object"]["sha"]
          base_tree = repo.git.trees(parent_commit)

          #create a tree pointing to refs sha
          tree = repo.git.trees.create({ tree: [{
            path: upload_path,
            mode: '100644',
            type: 'blob',
            sha: blob["sha"]
          }],
          base_tree: base_tree["sha"]})

          #create a new commit
          commit = repo.git.commits.create({ tree: tree["sha"], message: "uploading #{upload_path}" , parents: [parent_commit]})

          #update the ref
          ref = move_ref(repo, tree, commit)
        end

        #retreive the commit information from the ref
        commit = repo.commits(ref['object']['sha'])

        CarrierWave::Storage::GitHub::File.new commit['files'].first.to_h
      end
      
      class File
        def initialize(file)
          @file = file
        end

        def url(options = {})
          @file['raw_url']
        end
      end

      private
      def move_ref(repo, tree, commit)
        ref = repo.git.refs("huboard/uploads").patch({
          sha: commit["sha"]
        })

        if ref["object"] 
          return ref
        else
          parent_commit = repo.git.refs('huboard/uploads')['object']['sha']
          commit = repo.git.commits.create({ tree: tree["sha"], message: "merging conflict #{commit['sha']} && #{parent_commit}}" , parents: [parent_commit]})
          return move_ref(repo, tree, commit)
        end
      end
      def gh
        options = { access_token: @uploader.access_token }
        options[:api_url] = ENV["GITHUB_API_ENDPOINT"] if ENV["GITHUB_API_ENDPOINT"]
        Ghee.new(options) do |conn|
          conn.request :retry, 
            max: 4,
            exceptions: [
              Errno::ETIMEDOUT,
              'Timeout::Error',
              Faraday::TimeoutError,
              Faraday::ConnectionFailed,
          ]
        end
      end
    end
  end
end
