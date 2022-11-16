with import <nixpkgs> {};
let
  unstable = import <nixos-unstable> {};
in
stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        (yarn.override { nodejs = null; })
        nodejs-16_x
        act
        openssl
        unstable.cypress
        # node gyp dependencies
        python39
        gcc10
        cmake
        p7zip
        k6
        pigz
        pv
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        export CYPRESS_RUN_BINARY=$(which Cypress)
    '';
}
