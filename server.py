
#NOTE: You will have to update the ip address in index.html

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import json


class MainHandler(tornado.web.RequestHandler):
	def get(self):
		loader = tornado.template.Loader(".")
		self.write(loader.load("index.html").generate())

class WSHandler(tornado.websocket.WebSocketHandler):
	connections = []
  
	def check_origin(self, origin):
		return True

	def open(self):
		print('connection opened...')
		
	def on_message(self, message):
		obj = json.loads(message)
		if obj['data'] == None:
			for k,v in enumerate(self.connections):
				if v['token'] == obj['token']:
					self.connections.pop(k)
			self.connections.append({
				'self' : self,
				'token' : obj['token']
			})
		else:
			for v in self.connections:
				if obj['data']['blog_author'] == v['token']:
					v['self'].write_message(obj)

	def on_close(self):
		print('connection closed...')


application = tornado.web.Application([
	(r'/ws', WSHandler),
	(r'/', MainHandler),
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": "./resources"}),
])

if __name__ == "__main__":
	application.listen(9090)
	tornado.ioloop.IOLoop.instance().start()

