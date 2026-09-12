{
  description = "What the hell have you built?";

  nixConfig = {
    extra-substituters = ["https://nix-community.cachix.org"];
    extra-trusted-public-keys = [
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix = {
      url = "github:nix-community/bun2nix?ref=2.1.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    nixpkgs,
    flake-utils,
    bun2nix,
    ...
  }:
    flake-utils.lib.eachSystem
    [
      "x86_64-linux"
      "aarch64-linux"
    ]
    (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [bun2nix.overlays.default];
          config.allowUnfreePredicate = package: nixpkgs.lib.getName package == "nomad";
        };
        packageJson = builtins.fromJSON (builtins.readFile ./package.json);
        pname = "wthhyb-sacha-house";
        inherit (packageJson) version;
        src = pkgs.lib.cleanSourceWith {
          src = ./.;
          filter = path: _type:
            !builtins.elem (baseNameOf path) [
              ".git"
              ".jj"
              "dist"
              "node_modules"
              "result"
            ];
        };
        bunDeps = pkgs.bun2nix.fetchBunDeps {bunNix = ./bun.nix;};

        site = pkgs.bun2nix.mkDerivation {
          inherit
            pname
            version
            src
            bunDeps
            ;
          LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.stdenv.cc.cc.lib];
          buildPhase = ''
            runHook preBuild
            bun run build
            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall
            cp -r dist $out
            runHook postInstall
          '';
        };

        mkCheck = name: command:
          pkgs.bun2nix.mkDerivation {
            pname = "${pname}-${name}";
            inherit version src bunDeps;
            LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.stdenv.cc.cc.lib];
            buildPhase = ''
              runHook preBuild
              ${command}
              runHook postBuild
            '';
            installPhase = "touch $out";
          };

        actionlint =
          pkgs.runCommand "${pname}-actionlint"
          {
            nativeBuildInputs = [pkgs.actionlint];
          }
          ''
            actionlint -config-file ${src}/.github/actionlint.yaml ${src}/.github/workflows/*.yml
            touch $out
          '';

        dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "wthhyb.sacha.house";
          tag = version;
          contents = [pkgs.static-web-server];
          config = {
            Cmd = ["${pkgs.static-web-server}/bin/static-web-server"];
            Env = [
              "SERVER_ROOT=${site}"
              "SERVER_PORT=80"
            ];
            ExposedPorts."80/tcp" = {};
          };
        };
        nomadJobs = pkgs.runCommand "${pname}-nomad-jobs" {nativeBuildInputs = [pkgs.nomad pkgs.nomad-pack];} ''
          export HOME="$TMPDIR"
          image="ghcr.io/sachahjkl/wthhyb.sacha.house@sha256:0000000000000000000000000000000000000000000000000000000000000000"
          for environment in staging production; do
            cat > "$TMPDIR/$environment.vars.hcl" <<EOF
          name = "wthhyb-sacha-house"
          environment = "$environment"
          domain = "$environment.wthhyb.sacha.house"
          health_path = "/"
          image = "$image"
          port = 80
          service_tags = []
          volume_enabled = false
          volume_mount_path = ""
          volume_name = ""
          EOF
            nomad-pack render ${./deploy} --var-file "$TMPDIR/$environment.vars.hcl" \
              --to-dir "$TMPDIR/$environment" --auto-approve >/dev/null
            nomad job validate "$TMPDIR/$environment/homelab-application/application.nomad"
          done
          touch "$out"
        '';
      in {
        packages = {
          default = site;
          inherit dockerImage;
        };

        checks = {
          inherit actionlint dockerImage nomadJobs;
          build = site;
          format = mkCheck "format" "bun run format:check";
          lint = mkCheck "lint" "bun run lint";
          types = mkCheck "types" "bun run check";
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.bun
            pkgs.bun2nix
            pkgs.alejandra
          ];
        };

        formatter = pkgs.alejandra;
      }
    );
}
