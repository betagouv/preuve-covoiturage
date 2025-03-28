{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in
        {
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              postgresql_14

              # data stack
              python312
              jupyter
              python312Packages.dbt-postgres
              python312Packages.pandas
              python312Packages.numpy
              python312Packages.sqlalchemy
              python312Packages.psycopg2
              python312Packages.tabulate
              python312Packages.nbconvert
              python312Packages.jinja2
              python312Packages.duckdb

              pipenv
              pandoc
              texliveFull
              duckdb

              # misc
              gh
            ];
            shellHook = ''
              export PATH="$PWD/node_modules/.bin/:$PATH"
              export LESS="-SRXF"
              alias serve="jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser --NotebookApp.token=cerema"
            '';
          };
        });
}
