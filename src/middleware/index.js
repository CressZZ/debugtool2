const fs = require('fs');
const path = require('path');

/**
 * 파일 경로와 내용을 받아서 파일 생성 또는 내용 교체
 * @param {string} filePath - 만들거나 덮어쓸 파일 경로
 * @param {string} content - 파일에 쓸 텍스트 내용
 */
function writeTextToFile(filePath, content) {
  // const fullPath = path.resolve(process.cwd(), filePath);

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✨ 파일 저장 완료: ${filePath}`);
  } catch (err) {
    console.error(`💥 파일 저장 실패: ${err.message}`);
  }
}

function kitPositionDebugTool_middlewares(middlewares, devServer) {
	if (!devServer) throw new Error('webpack-dev-server가 없음. 이게 왜 없냐?');

	const app = devServer.app;

	// body 파싱 (중요)
	app.use(require('express').json());


	// POST API 추가
	app.post('/api/write', (req, res) => {
		const body = req.body;

		if (!Array.isArray(body) || body.length !== 2) {
			return res.status(400).json({ error: '잘못된 입력이야. 배열로 [경로, 내용] 넘겨야 해.' });
		}

		const [filePath, content] = body;
		console.log(filePath, content)
		try {
			console.log(path.resolve('./', filePath), content)
			writeTextToFile(filePath, content);
			res.json({ message: '파일 저장 완료' });
		} catch (err) {
			throw res.status(500).json({ error: err.message });
		}
	});

	return middlewares;
}


module.exports =  kitPositionDebugTool_middlewares;
