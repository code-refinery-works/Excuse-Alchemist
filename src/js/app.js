// =====================
    // STATE
    // =====================
    let currentScreen = 'top';
    let selectedSituation = '';
    let selectedTarget = '';
    let selectedSeverity = '';
    let generationCount = 0;
    let history = [];
    let freezeActive = false;
    let seizaActive = false;
    let seizaAngle = 0;
    let bossKeyActive = false;

    // =====================
    // BOSS KEY (ESC x2)
    // =====================
    let escCount = 0;
    let escTimer = null;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        escCount++;
        if (escCount === 1) {
          escTimer = setTimeout(() => { escCount = 0; }, 500);
        } else if (escCount >= 2) {
          clearTimeout(escTimer);
          escCount = 0;
          toggleBossKey();
        }
      }
    });

    function toggleBossKey() {
      bossKeyActive = !bossKeyActive;
      const overlay = document.getElementById('bossKeyOverlay');
      overlay.style.display = bossKeyActive ? 'flex' : 'none';
    }

    // =====================
    // SCREEN TRANSITIONS
    // =====================
    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      currentScreen = id;
    }

    function goToInput() {
      showScreen('screenInput');
    }

    function goBack() {
      if (currentScreen === 'screenInput') showScreen('screenTop');
      else if (currentScreen === 'screenOutput') showScreen('screenInput');
      else if (currentScreen === 'screenTools') showScreen('screenTop');
    }

    function goToTools() {
      showScreen('screenTools');
      showTool('toolFreeze');
    }

    // =====================
    // SELECTION
    // =====================
    function select(group, value, el) {
      document.querySelectorAll(`.option-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
      if (group === 'situation') selectedSituation = value;
      if (group === 'target') selectedTarget = value;
      if (group === 'severity') selectedSeverity = value;
      checkReady();
    }

    function checkReady() {
      const btn = document.getElementById('generateBtn');
      if (selectedSituation && selectedTarget && selectedSeverity) {
        btn.disabled = false;
        btn.textContent = '🚀 言い訳を生成する';
      }
    }

    // =====================
    // EXCUSE GENERATION ENGINE
    // =====================
    const excuseDB = {
      sincere: {
        '起きれなかった': {
          '上司': [
            '大変申し訳ございません。昨晩、サーバー障害の緊急対応で深夜3時まで対応しており、アラームが鳴っても身体が動かない状態でした。今後はバックアップのアラームを5つ設定し、万全を期します。',
            '誠に恥ずかしながら、体調管理が不十分でした。昨夜から軽い発熱があり、無理に出勤してご迷惑をおかけするよりと思い横になっておりましたが、連絡が遅れました点、深くお詫び申し上げます。',
            '深くお詫び申し上げます。近隣工事の騒音で夜間の睡眠が取れない日が続いており、本日ついに限界を迎えました。防音対策を講じ、二度とこのようなことがないよう努めます。'
          ],
          'クライアント': [
            '誠に申し訳ございません。本日の打ち合わせに遅参し、貴重なお時間をいただきながら大変失礼いたしました。交通機関の遅延が重なり、想定外の事態となりました。',
            '先ほどの件、改めて深くお詫び申し上げます。朝方から体調に異変を感じ、対応が後手に回ってしまいました。今後は早めのご連絡を徹底いたします。',
            'この度はご迷惑をおかけし、誠に申し訳ございません。社内の緊急会議が突発的に入り、ご連絡が遅れてしまいました。改めてお詫び申し上げます。'
          ],
          '恋人': [
            'ほんとにごめん。昨日遅くまで仕事してて気絶するように寝ちゃった。大事な約束だったのに、次は絶対に守る。',
            'ごめんね、スマホのアラーム全部気づかなかった。心配かけてほんとに申し訳ない。',
            '本当にごめん。最近疲れが溜まってて。でも言い訳にしたくない、次は絶対に気をつける。'
          ]
        },
        '忘れていた': {
          '上司': [
            '大変失礼いたしました。タスク管理ツールへの登録漏れがあり、完全に私のミスです。同様のことが起きないよう、ダブルチェック体制を今日から導入します。',
            '誠に申し訳ございません。複数案件が重なり、優先度管理が甘くなっておりました。即刻対応します。',
            '深くお詫び申し上げます。私の確認不足でした。本日中に完了させ、報告いたします。'
          ],
          'クライアント': [
            '大変失礼いたしました。社内の情報共有に不備があり、ご指示の件が私まで届いておりませんでした。早急に対応いたします。',
            '誠に申し訳ございません。確認漏れがございました。すぐに対処し、進捗をご報告します。',
            'ご指摘いただきありがとうございます。私どもの連携ミスです。今後このようなことがないよう、フローを見直します。'
          ],
          '恋人': [
            'ほんとにごめん、すっかり忘れてた。言い訳できない。どうしたら許してもらえる？',
            'ごめん、仕事がバタバタしてて頭から消えちゃってた。大切にしてるのに、こういうことしてほんとダメだな自分。',
            '本当に申し訳ない。メモしておけばよかった。次は絶対にカレンダーに入れる。'
          ]
        },
        'やる気が起きない': {
          '上司': [
            '最近、パフォーマンスが落ちていることを自覚しており、申し訳ありません。業務の整理と生活習慣の改善に取り組んでいます。',
            '少し心身の疲れを感じております。本日は集中力を取り戻すよう努めます。',
            '業務に支障が出ていること、お詫びします。体調管理を改め、早急に立て直します。'
          ],
          'クライアント': [
            '対応が遅くなり、申し訳ございません。社内でリソース調整を行い、スピードを上げて参ります。',
            'ご迷惑をおかけしており恐縮です。改善策を講じ、今後は迅速な対応を心がけます。',
            '不手際をお詫び申し上げます。体制を整え直し、誠実に対応いたします。'
          ],
          '恋人': [
            'ちょっと最近しんどくて、ごめんね。話を聞いてほしいな。',
            'やる気が出なくて、迷惑かけてごめん。でも一緒にいると元気出る。',
            '正直に言うと疲れ気味で。でも大切な人との時間は削りたくなかった。'
          ]
        },
        '存在しないタスクだと思っていた': {
          '上司': [
            '誠に申し訳ございません。認識の齟齬がありました。今後は指示いただいた内容を書面で確認するよう徹底します。',
            '私の理解が不足しておりました。以後、不明点はその場で確認します。',
            '確認不足でした。深くお詫び申し上げます。即座に対応します。'
          ],
          'クライアント': [
            '情報の共有が不十分で、認識違いが生じてしまいました。大変申し訳ございません。',
            '弊社内での連携ミスでした。お客様にご迷惑をおかけし、誠に恐縮です。',
            'ご指摘の通りです。確認漏れを反省し、再発防止に努めます。'
          ],
          '恋人': [
            'そんな約束してたっけ？…ごめん、してたね。完全に勘違いしてた。',
            '聞いてたのに忘れてたみたい。ほんとにごめんね。',
            'え、そうだったの！？全然違う認識してた、ごめん。'
          ]
        }
      },
      forceMajeure: {
        '起きれなかった': {
          '上司': [
            '大変申し訳ございません。深夜、自宅マンションのエレベーター内に迷い込んだツバメを自然に帰すオペレーションに手間取り、帰宅が明け方になってしまいました。現在猛ダッシュで向かっております（あと15分）！',
            '誠に恐れ入ります。本日未明、なぜか自室の窓ガラスが気圧差で突然割れ、その後始末と近隣への謝罪対応で夜が明けてしまいました。',
            '申し訳ございません。目覚ましが6個とも同時刻に電池切れするという統計的奇跡（確率1.7億分の1）に見舞われました。今後は電源式アラームに切り替えます。'
          ],
          'クライアント': [
            '大変失礼いたしました。弊社周辺で地域一斉の電気工事が行われており、あらゆる通知が届かない状況でした。',
            '誠に申し訳ございません。本日朝、前を歩いていた方が急に倒れ、救護対応をしておりました。',
            '恐れ入ります。最寄り駅で人身事故が発生し、全路線が運転見合わせとなっております。'
          ],
          '恋人': [
            'ごめん！隣の部屋で赤ちゃんが夜泣きしてて一睡もできなかって気絶してた。',
            'スマホが完全に充電できてなくて電源落ちてたみたい。本当に起きれなかった。',
            '信じてほしいんだけど、近くで工事始まってアラームの音が聞こえなかった。'
          ]
        },
        '忘れていた': {
          '上司': [
            '申し訳ございません。昨日、社内システムのバグでカレンダー通知が全て昨年の日付にリセットされていたようです。IT部門に確認中です。',
            '誠に恐縮ですが、先週からスパムメールが異常増加しており、重要なご連絡がフィルタリングされてしまっておりました。',
            'ご迷惑をおかけしました。社内の情報共有ツールが昨夜メンテナンスで落ちており、展開された情報が私まで届いていなかった次第です。'
          ],
          'クライアント': [
            '大変失礼いたしました。弊社システムのメール障害により、ご連絡の一部が受信できていなかったことが判明しました。',
            '誠に申し訳ございません。担当者の急病により、引き継ぎが完全でなかった部分がございました。',
            '恐れ入ります。会議室の二重予約が発生しており、そちらの対応に追われてしまいました。'
          ],
          '恋人': [
            'ほんとごめん！スマホのカレンダーアプリがアップデート後からバグってて通知来なかった。',
            'え、待って、それLINEで来てた？通知オフになってたかも。本当にごめん。',
            'ちょうどその時間、電車乗ってて通知見れなかった。あとで気づいて焦った。'
          ]
        },
        'やる気が起きない': {
          '上司': [
            '恐れ入ります。数日前から原因不明の頭痛が続いており、昨日ようやく病院に行ったところ「過労気味」との診断を受けました。',
            '申し訳ございません。季節の変わり目で自律神経が乱れているようで、専門家に相談しています。',
            '実はここ数日、近隣の道路工事騒音で慢性的な睡眠不足に陥っており、集中力の低下を招いています。'
          ],
          'クライアント': [
            '弊社内でインフルエンザが流行しており、チームの稼働率が著しく低下しております。',
            'サーバーの断続的な不具合が続いており、作業効率に影響が出ております。',
            '社内システムの移行作業と通常業務が重なっており、一時的にリソースが逼迫しております。'
          ],
          '恋人': [
            '実は低気圧が来てて、ほんとに頭が重くて。気象病ってやつかも。',
            'ちょっと更年期…じゃないけど、ホルモンバランスが乱れてる気がする。',
            '最近花粉がひどくて薬飲んでるんだけど、副作用で眠くて仕方ない。'
          ]
        },
        '存在しないタスクだと思っていた': {
          '上司': [
            '申し訳ございません。当該ファイルが社内ネットワークドライブのキャッシュ障害でゴミ箱フォルダに自動移動されており、私も気づかなかった次第です。',
            '先日のシステムアップデート後、タスク管理ツールの一部データが別プロジェクトのフォルダと混在してしまっていたようです。',
            'スレッドが途中で分岐しており、私が参照していたのが旧スレッドだったようです。ツールの仕様変更が原因です。'
          ],
          'クライアント': [
            '弊社内でご依頼内容の転記ミスが発生しており、別チームの案件と混同してしまっておりました。',
            '申し訳ございません。バージョン管理上のご指示が旧版のドキュメントを参照してしまっておりました。',
            '社内システム移行の際に、該当タスクが消失していたことが判明しました。大変失礼いたしました。'
          ],
          '恋人': [
            '本当にそれ聞こえてなかったのかも、そのとき外が凄い雨で。ごめん。',
            'LINEのメッセージ、トーク画面スクロールしてたら通知が埋もれてた。',
            '前に話してたのと別の話だと思ってた、ごめんね。'
          ]
        }
      },
      philosophy: {
        '起きれなかった': {
          '上司': [
            '「目覚め」とは何でしょうか。仏教では「覚醒」こそ悟りへの道とされますが、本日の私の覚醒は、ただ会社に向かうよりも深い次元で自己と向き合う時間でした。その結果、より高い生産性で臨める状態が整いました。遅参をお許しください。',
            'ドイツの哲学者ヘーゲルは「精神は夜の内に成熟する」と述べました。本日私の精神は、通常の2.3倍の時間をかけて成熟しておりました。熟成された私の知性を、本日の業務に存分に活用させていただきます。',
            '「時間とは何か」という問いに、アインシュタインですら完全な答えを出せなかった。ならば私の遅刻は、時間の相対性理論に従えば、観測者の立場によって「遅刻」にも「適時」にもなりえる。そう考えることは……できませんよね。大変申し訳ございません。'
          ],
          'クライアント': [
            '「始まりの時刻」は、文化によって大きく異なります。スペインのビジネス慣習では、約束の時刻より15分遅れることが礼儀とされる場合もございます。本日は少々その概念が勝ってしまいました。',
            '量子力学の観点からは、私は「到着した状態」と「遅刻した状態」の重ね合わせとして存在しておりました。観測（ご連絡）いただいた瞬間、到着状態に収束する予定でした。',
            'ゆく川の流れは絶えずして、されど水は同じではない。時もまた然り。遅参いたしましたこと、衷心よりお詫び申し上げます。'
          ],
          '恋人': [
            '「待つ」という行為は、愛の深さに比例する。つまり、あなたが私を待てたなら、それはあなたの愛の証明でもある——なんて言ったら怒るよね。本当にごめん。',
            '哲学的に言えば、「遅刻」は相手への期待値と現実の乖離が生む感情。でも今の私に哲学は要らなくて、ただごめんねって言いたい。',
            '時間って不思議だよね、待ってる側は遅く感じて、寝てる側は速く感じる。……ほんとごめん。'
          ]
        },
        '忘れていた': {
          '上司': [
            '人間の記憶とは、脳のニューラルネットワークが確率的に再構成するものです。本日の「忘却」は、私の海馬が高負荷状態においてLTP（長期増強）に失敗したためであり、むしろ私のニューロンが限界まで仕事をしていた証拠と言えます。',
            '「記憶の欠如」は「存在の証明」である、とサルトルなら言うかもしれません。忘れるほど没頭していた、ということで……どうでしょうか。',
            '情報は忘れることで初めて整理される、というのが最新の神経科学の知見です。今まさに整理が完了し、最適な状態でタスクに臨む所存です。'
          ],
          'クライアント': [
            '人は大切なことを無意識のうちに「適切なタイミング」まで保存することがあります。今が、その適切なタイミングかもしれません。',
            '「忘れる」という能力は、人間の知性の証です。コンピューターと違い、人は不要な情報を捨てながら本質を見る。本日その能力が少し過剰に作用いたしました。',
            '禅の世界では、「忘却」は「空（くう）」への入口とされます。しかしながらビジネスにおいては入口を閉じておくべきでした。深くお詫びします。'
          ],
          '恋人': [
            '忘れることって、ある意味で信頼の証でもある気がして——いや、それは違うね。ごめんね。',
            'ニーチェは「忘れる能力こそ健康的精神の証」と言ったらしい。でも今それを言うのは最悪だね。ごめん。',
            '記憶ってさ、感情と紐づいてると残りやすいんだって。もっと大事に思えばよかった。'
          ]
        },
        'やる気が起きない': {
          '上司': [
            '「意志の力には限界がある」というエゴ・ディプレッション理論があります。本日は私の意志力が一時的に枯渇した状態であり、これは前日の高い集中力の証明でもあります。',
            'カフカの主人公が朝起きたら虫になっていたように、私も今朝、タスクに向かえない何者かに変容していたのかもしれません。しかし今、人間に戻りました。',
            '「無為にして為さざるなし」という老子の言葉があります。つまり、何もしないことで最大の成果が生まれる。……それは在宅勤務の話ではないので、今から全力で挽回します。'
          ],
          'クライアント': [
            'エネルギーの保存と集中には、一時的な蓄積期間が必要です。今まさにその期間が終了し、最高の状態でプロジェクトに臨む準備が整いました。',
            '「充電の必要ない機械は壊れた機械だ」という言葉がございます。私は今正しく充電を終えました。',
            '創造的な仕事には「孵化期間（インキュベーション）」が必要です。本期間はまさにその孵化期間でした。'
          ],
          '恋人': [
            '人間のエネルギーには波があって、今ちょうど谷の底にいる感じ。隣にいてくれるだけで少し上向けそう。',
            'バッテリーが0%の状態だったんだよね。急速充電、お願いしてもいい？',
            'やる気とかモチベーションって、人から分けてもらえる気がする。少しわけてほしい。'
          ]
        },
        '存在しないタスクだと思っていた': {
          '上司': [
            '「知らないことを知らない」という二重の無知、いわゆる「ダニング=クルーガー効果の第二層」に私は陥っていたようです。今後は「自分が知らない可能性に対して知的謙虚さを保つ」所存です。',
            'シュレーディンガーの猫のように、私にとってそのタスクは「存在している状態」と「存在していない状態」の重ね合わせでした。今確認によって存在が確定しました。',
            '「幽霊は信じる人にしか見えない」という話がありますが、タスクも信じて確認した人にしか存在しない——という言い訳は通じませんよね。申し訳ございません。'
          ],
          'クライアント': [
            '認識の共有とは、なんと難しいことでしょうか。ウィトゲンシュタインは「言語の限界は世界の限界だ」と言いましたが、まさに言語の齟齬が世界を歪めた事例かと思います。',
            '「地図は領
土ではない」というコリブスキーの格言があります。私の認識という地図に、そのタスクが描かれていなかった。地図の更新を怠った私の落ち度です。',
            '存在するかどうか分からないものへの対処法を、哲学者たちは数千年議論してきました。私もその議論に加わっていたと思ってください。今は存在を確認しました。'
          ],
          '恋人': [
            'え、そんな約束してたっけ……？記憶を遡っても見つからなくて。でも、あなたが覚えてるなら、それが真実だよね。ごめんね。',
            '私の中に存在しなかったんじゃなくて、ちゃんと大事にしまいすぎて見つからなかっただけ。',
            '「言った」「言ってない」の平行線は、どちらが正しいかより、どちらが歩み寄るかが大事だと思う。今回は私が歩み寄ります。'
          ]
        }
      };

      const situation = document.getElementById('situation').value;
      const target = document.getElementById('target').value;

      const results = excuseData[situation]?.[target];

      if (!results) {
        outputDiv.innerHTML = '<p style="color:#ff6b6b;">申し訳ありません、その組み合わせの言い訳は現在生成できませんでした。退職をご検討ください。</p>';
        return;
      }

      const styles = [
        { label: '① 誠実系', icon: '🙏', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50' },
        { label: '② 不可抗力系', icon: '🌪️', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', borderColor: '#FF9800' },
        { label: '③ 哲学・煙に巻く系', icon: '🌀', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)', borderColor: '#9C27B0' }
      ];

      let html = '<div style="animation: fadeIn 0.5s ease;">';
      results.forEach((excuse, i) => {
        html += `
          <div class="excuse-card" style="background: ${styles[i].bgColor}; border-left: 4px solid ${styles[i].borderColor}; padding: 18px; margin-bottom: 16px; border-radius: 8px; position: relative;">
            <div style="color: ${styles[i].color}; font-weight: bold; margin-bottom: 10px; font-size: 1rem;">
              ${styles[i].icon} ${styles[i].label}
            </div>
            <p style="color: #e0e0e0; line-height: 1.8; font-size: 0.95rem; margin: 0 0 12px 0;">${excuse}</p>
            <button class="copy-btn" onclick="copyExcuse(this, \`${excuse.replace(/`/g, '\\`')}\`)" 
              style="background: ${styles[i].color}; color: white; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: bold; transition: all 0.2s;">
              📋 これで乗り切る
            </button>
          </div>`;
      });

      html += `
        <div style="margin-top: 24px; padding: 16px; background: rgba(255,50,50,0.08); border: 1px dashed #ff6b6b; border-radius: 8px; text-align: center;">
          <p style="color: #ff9a9a; font-size: 0.85rem; margin: 0 0 10px 0;">⚠️ 全ての言い訳が機能しなかった場合の最終手段</p>
          <button onclick="showRetirement()" style="background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; border: none; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; font-weight: bold;">
            🚪 退職代行サービスを検討する（広告）
          </button>
        </div>
      </div>`;

      outputDiv.innerHTML = html;
      outputDiv.style.display = 'block';
      outputSection.style.display = 'block';

      setTimeout(() => {
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 800);
  }

  function copyExcuse(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = '✅ コピーしました！';
      btn.style.background = '#2196F3';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const original = btn.innerHTML;
      btn.innerHTML = '✅ コピーしました！';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    });
  }

  function showRetirement() {
    const modal = document.getElementById('retirementModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);
  }

  function closeRetirement() {
    const modal = document.getElementById('retirementModal');
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
  }

  // Zoom フリーズ機能
  let zoomActive = false;
  function activateZoomFreeze() {
    if (zoomActive) return;
    zoomActive = true;
    const overlay = document.getElementById('zoomOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.style.opacity = '1', 10);

    const canvas = document.getElementById('glitchCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let frame = 0;
    function drawGlitch() {
      if (!zoomActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // ブロックノイズ描画
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const w = Math.random() * 80 + 20;
        const h = Math.random() * 40 + 10;
        const r = Math.floor(Math.random() * 100);
        const g = Math.floor(Math.random() * 100);
        const b = Math.floor(Math.random() * 100);
        ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
        ctx.fillRect(x, y, w, h);
      }

      // 走査線
      for (let y = 0; y < canvas.height; y += 4) {
        if (Math.random() > 0.7) {
          ctx.fillStyle = `rgba(0,0,0,0.3)`;
          ctx.fillRect(0, y, canvas.width, 2);
        }
      }

      frame++;
      if (frame < 60) {
        requestAnimationFrame(drawGlitch);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('接続が切断されました', canvas.width/2, canvas.height/2 - 20);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('ネットワークエラー (ERR_CONNECTION_RESET)', canvas.width/2, canvas.height/2 + 10);
      }

      if (frame > 120) {
        zoomActive = false;
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
      }
    }
    drawGlitch();

    // 音声テキスト
    const audioText = document.getElementById('audioGlitchText');
    const phrases = ['ｱ…', 'ｴ…ｯﾄ…', 'ｷｺ…', 'ﾌﾞﾂ…', '（無音）'];
    let pi = 0;
    const audioInterval = setInterval(() => {
      if (pi < phrases.length) {
        audioText.textContent = phrases[pi];
        pi++;
      } else {
        clearInterval(audioInterval);
        audioText.textContent = '── 接続切断 ──';
      }
    }, 300);

    setTimeout(() => {
      if (zoomActive) {
        zoomActive = false;
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
      }
    }, 8000);
  }

  function deactivateZoom() {
    zoomActive = false;
    const overlay = document.getElementById('zoomOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  }

  // サウンドボード
  function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'cough') {
      // 咳の音をWeb Audio APIで生成
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        // 咳っぽいノイズ
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * (t < 0.05 ? t * 20 : 1) * 0.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.8;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      showSoundFeedback('cough', '🤧 「ゴホッ...ゴホッ...」');
    } else if (type === 'sniff') {
      // 鼻をすする音
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.2 * Math.sin(t * 800);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      showSoundFeedback('sniff', '😮‍💨 「ズズッ...」');
    } else if (type === 'siren') {
      // サイレン音
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.0);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.2);
      showSoundFeedback('siren', '🚑 「ピーポーピーポー（遠くの方で）」');
    }
  }

  function showSoundFeedback(type, text) {
    const btn = document.querySelector(`[data-sound="${type}"]`);
    const feedback = document.getElementById('soundFeedback');
    feedback.textContent = text;
    feedback.style.opacity = '1';
    setTimeout(() => feedback.style.opacity = '0', 2000);
  }

  // 土下座角度測定
  let gyroActive = false;
  function startGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(response => {
        if (response === 'granted') {
          startGyroMeasure();
        }
      }).catch(console.error);
    } else if (window.DeviceOrientationEvent) {
      startGyroMeasure();
    } else {
      // デスクトップ用デモ
      simulateGyro();
    }
  }

  function startGyroMeasure() {
    gyroActive = true;
    document.getElementById('gyroStatus').textContent = '📡 センサー接続中...';
    window.addEventListener('deviceorientation', handleOrientation);
    setTimeout(() => {
      if (gyroActive) simulateGyro();
    }, 2000);
  }

  function handleOrientation(e) {
    const beta = Math.abs(e.beta || 0);
    updateGyroDisplay(beta);
  }

  function simulateGyro() {
    document.getElementById('gyroStatus').textContent = '📡 デモモード（PCではシミュレーション）';
    let angle = 0;
    let direction = 1;
    const interval = setInterval(() => {
      angle += direction * 2;
      if (angle >= 90) direction = -1;
      if (angle <= 0) direction = 1;
      updateGyroDisplay(angle);
    }, 50);
    setTimeout(() => clearInterval(interval), 8000);
  }

  function updateGyroDisplay(angle) {
    const display = document.getElementById('angleDisplay');
    const score = document.getElementById('gyroScore');
    const advice = document.getElementById('gyroAdvice');
    
    display.textContent = Math.round(angle) + '°';
    
    if (angle >= 45 && angle <= 80) {
      score.textContent = '✨ 黄金角！誠意スコア: ' + Math.round(80 + (angle - 45) / 35 * 20) + '/100';
      score.style.color = '#FFD700';
      advice.textContent = 'この角度は「本気の謝罪」が伝わります！';
    } else if (angle < 45) {
      score.textContent = '😅 誠意スコア: ' + Math.round(angle * 1.5) + '/100';
      score.style.color = '#FF9800';
      advice.textContent = 'もっと深く下げてください。誠意が足りません。';
    } else {
      score.textContent = '⚠️ 誠意スコア: 99/100（やりすぎ注意）';
      score.style.color = '#f44336';
      advice.textContent = '床に額をつけそうです。体への負担を考慮してください。';
    }

    const head = document.getElementById('headIndicator');
    if (head) {
      head.style.transform = `rotate(${Math.min(angle, 90)}deg)`;
    }
  }

  // 猫キーボード画像生成
  function generateCatImage() {
    const canvas = document.getElementById('catCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('catImageContainer');
    
    // ランダムな猫テキスト
    const catTexts = [
      'asdfghjk;;;;;',
      'qqqqwwwweeee',
      '3333333333333',
      'poiuytrewqlkjh',
      'zzzzxxxxxcccc',
      ';;;;;;;;;;;;;;'
    ];
    const randomText = catTexts[Math.floor(Math.random() * catTexts.length)];
    document.getElementById('catTextDisplay').textContent = randomText;

    // 画像生成
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景（デスクの色）
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // キーボード
    ctx.fillStyle = '#d0d0d0';
    ctx.roundRect(30, canvas.height - 100, canvas.width - 60, 80, 5);
    ctx.fill();
    
    // キーボードのキー
    ctx.fillStyle = '#f5f5f5';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        ctx.fillRect(40 + col * 31, canvas.height - 93 + row * 24, 28, 20);
      }
    }
    
    // 猫の体（シルエット）
    ctx.fillStyle = Math.random() > 0.5 ? '#888888' : '#FFA500';
    
    // 胴体
    ctx.beginPath();
    ctx.ellipse(canvas.width/2, canvas.height - 130, 70, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 頭
    ctx.beginPath();
    ctx.arc(canvas.width/2 + 50, canvas.height - 165, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳（左）
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 + 30, canvas.height - 192);
    ctx.lineTo(canvas.width/2 + 18, canvas.height - 210);
    ctx.lineTo(canvas.width/2 + 42, canvas.height - 205);
    ctx.fill();
    
    // 耳（右）
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 + 58, canvas.height - 195);
    ctx.lineTo(canvas.width/2 + 70, canvas.height - 212);
    ctx.lineTo(canvas.width/2 + 72, canvas.height - 197);
    ctx.fill();
    
    // 目
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(canvas.width/2 + 42, canvas.height - 168, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(canvas.width/2 + 60, canvas.height - 168, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ひげ
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(canvas.width/2 + 20, canvas.height - 158 + i * 4);
      ctx.lineTo(canvas.width/2 + 38, canvas.height - 158 + i * 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width/2 + 62, canvas.height - 158 + i * 4);
      ctx.lineTo(canvas.width/2 + 80, canvas.height - 158 + i * 4);
      ctx.stroke();
    }
    
    // しっぽ
    ctx.strokeStyle = ctx.fillStyle;
    ctx.fillStyle = '#888888';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 65, canvas.height - 130);
    ctx.quadraticCurveTo(canvas.width/2 - 100, canvas.height - 100, canvas.width/2 - 80, canvas.height - 80);
    ctx.stroke();
    
    // EXIFデータ表示
    const now = new Date();
    const exifData = `撮影日時: ${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}
カメラ: iPhone 15 Pro | ISO: 800 | f/1.8 | 1/60s
GPS: 35.6762° N, 139.6503° E（自宅）`;
    
    document.getElementById('exifData').textContent = exifData;
    container.style.display = 'block';
    
    // ダウンロードボタン有効化
    const dlBtn = document.getElementById('downloadCatBtn');
    dlBtn.disabled = false;
    dlBtn.onclick = () => {
      const link = document.createElement('a');
      link.download = 'neko_keyboard_evidence.png';
      link.href = canvas.toDataURL();
      link.click();
    };
  }

  // Boss Key（Esc × 2）
  let escCount = 0;
  let escTimer = null;
  let bossKeyActive = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (bossKeyActive) {
        deactivateBossKey();
        return;
      }
      escCount++;
      if (escTimer) clearTimeout(escTimer);
      if (escCount >= 2) {
        escCount = 0;
        activateBossKey();
      } else {
        escTimer = setTimeout(() => { escCount = 0; }, 500);
      }
    }
  });

  function activateBossKey() {
    bossKeyActive = true;
    document.getElementById('bossKeyOverlay').style.display = 'block';
    setTimeout(() => document.getElementById('bossKeyOverlay').style.opacity = '1', 10);
  }

  function deactivateBossKey() {
    bossKeyActive = false;
    const overlay = document.getElementById('bossKeyOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  }

  // タブタイトル偽装
  document.title = 'AWS Well-Architected Framework - Best Practices';
  document.querySelector('link[rel="icon"]') || (() => {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>';
    document.head.appendChild(favicon);
  })();

  // 8:55 - 9:10 アクセス警告
  function checkPeakTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if ((h === 8 && m >= 55) || (h === 9 && m <= 10)) {
      const banner = document.getElementById('peakTimeBanner');
      banner.style.display = 'block';
    }
  }
  checkPeakTime();
  setInterval(checkPeakTime, 60000);