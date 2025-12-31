# programmed-to-survive

## GitHub Pages 配信

### 本番URL
- `master` 反映先: `https://<owner>.github.io/<repo>/`

### ブランチプレビューURL
- `master` 以外のブランチに push すると、`gh-pages` ブランチの `/<SAFE_BRANCH>/` にデプロイされます。
- プレビューURL: `https://<owner>.github.io/<repo>/<SAFE_BRANCH>/`

### SAFE_BRANCH ルール
- 変換元: `GITHUB_REF_NAME`
- `/` `:` `@` 空白 などは `-` に置換
- それ以外の記号も `-` へ置換し、英数字・`._-` のみ許可

### スマホでの確認フロー
1. 対象ブランチへ push し、GitHub Actions の「Deploy GitHub Pages (branch preview)」が成功していることを確認
2. PR コメントの Preview URL をスマホで開く
3. 画面が縦向きの状態で以下を確認
   - ゲームが起動する
   - タップ/クリックが反応する
   - UI が崩れない
   - 60秒放置しても落ちない
   - 致命的な console error が出ていない

## フェーズ1プロトタイプ概要
- 設定画面で難易度を選び、右クリックで戦闘を開始します。
- 3 WAVE を突破するとスコアが確定し、クリックで再挑戦できます。
- 障害物はタイプ分けせず、位置固定のオブジェクトとして配置しています。

## 開発メモ
- 配信対象は `public/` ディレクトリ
- ソースは `src/` にあり、`./scripts/build.sh` で `public/` を生成します（`public/` はコミット対象外）
- Phaser は CDN から読み込むため、絶対パス（例: `/assets/...`）は使用せず、相対パスで参照してください
