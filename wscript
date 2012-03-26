import os
import sys
import Options
from Configure import ConfigurationError
from os.path import exists
from shutil import copy2 as copy, rmtree

# node-wafadmin
import Options
import Utils


TARGET = 'sqlite3_bindings'
TARGET_FILE = '%s.node' % TARGET
built = 'build/Release/%s' % TARGET_FILE
dest = 'lib/%s' % TARGET_FILE

BUNDLED_SQLITE3_VERSION = '3070800'
BUNDLED_SQLITE3 = 'sqlite-autoconf-%s' % BUNDLED_SQLITE3_VERSION
BUNDLED_SQLITE3_TAR = 'sqlite-autoconf-%s.tar.gz' % BUNDLED_SQLITE3_VERSION
SQLITE3_TARGET = 'deps/%s' % BUNDLED_SQLITE3

sqlite3_test_program = '''
#include <cstdio>"
#ifdef __cplusplus
extern "C" {
#endif
#include <sqlite3.h>
#ifdef __cplusplus
}
#endif

int
main() {
    return 0;
}
'''

boost_thread_test_program = '''
#include <boost/thread/mutex.hpp>

int
main() {
    boost::mutex mutex_;
    return 0;
}
'''


def set_options(opt):
  opt.tool_options("compiler_cxx")
  opt.add_option( '--with-sqlite3'
                , action='store'
                , default=None
                , help='Directory prefix containing sqlite "lib" and "include" files (default is to compile against internal copy of sqlite v%s' % BUNDLED_SQLITE3_VERSION
                , dest='sqlite3_dir'
                )

  opt.add_option( '--with-boost'
                , action='store'
                , default=None
                , help='Directory prefix containing boost "lib" and "include" files (default is to use pthreads not boost for threading support)'
                , dest='boost_dir'
                )

def _conf_exit(conf,msg):
    conf.fatal('\n\n' + msg + '\n...check the build/config.log for details')

def _build_paths(conf,prefix):
    if not os.path.exists(prefix):
        _conf_exit(conf,'configure path of %s not found' % prefix)
    norm_path = os.path.normpath(os.path.realpath(prefix))
    if norm_path.endswith('lib') or norm_path.endswith('include'):
        norm_path = os.path.dirname(norm_path)
    return os.path.join('%s' % norm_path,'lib'),os.path.join('%s' % norm_path,'include')

def configure(conf):
  conf.check_tool("compiler_cxx")
  conf.check_tool("node_addon")

  o = Options.options

  if not o.sqlite3_dir:
      configure_internal_sqlite3(conf)
  else:
      lib, include = _build_paths(conf,o.sqlite3_dir)

      if conf.check_cxx(lib='sqlite3',
                fragment=sqlite3_test_program,
                uselib_store='SQLITE3',
                libpath=lib,
                msg='Checking for libsqlite3 at %s' % lib,
                includes=include):
          Utils.pprint('GREEN', 'Sweet, found viable sqlite3 dependency at: %s ' % o.sqlite3_dir)

      else:
          _conf_exit(conf,'sqlite3 libs/headers not found at %s' % o.sqlite3_dir)

  linkflags = []

  if o.boost_dir:
      lib, include = _build_paths(conf,o.boost_dir)
      if conf.check_cxx(lib='boost_thread',
                fragment=boost_thread_test_program,
                uselib_store='SQLITE3',
                libpath=lib,
                msg='Checking for libboost_thread at %s' % lib,
                includes=include):
          Utils.pprint('GREEN', 'Sweet, found viable boost dependency at: %s ' % o.boost_dir)
          conf.env.append_value("CXXFLAGS_SQLITE3", ['-DNODE_SQLITE3_BOOST_THREADING'])
      else:
          _conf_exit(conf,'boost libs/headers not found at %s' % o.boost_dir)

  else:
      conf.env.append_value("CXXFLAGS_SQLITE3", ["-pthread"])

  if os.environ.has_key('LINKFLAGS'):
      linkflags.extend(os.environ['LINKFLAGS'].split(' '))

  if not o.sqlite3_dir and Options.platform == 'darwin':
      linkflags.append('-Wl,-search_paths_first')

  conf.env.append_value("LINKFLAGS", linkflags)

def configure_internal_sqlite3(conf):
      Utils.pprint('GREEN','Note: will build against internal copy of sqlite3 v%s\n(pass --with-sqlite3=/usr/local to build against an external version)' % BUNDLED_SQLITE3_VERSION)

      os.chdir('deps')
      if not os.path.exists(BUNDLED_SQLITE3):
          os.system('tar xf %s' % BUNDLED_SQLITE3_TAR)
      os.chdir(BUNDLED_SQLITE3)
      cxxflags = ''
      if os.environ.has_key('CFLAGS'):
          cxxflags += os.environ['CFLAGS']
          cxxflags += ' '
      if os.environ.has_key('CXXFLAGS'):
          cxxflags += os.environ['CXXFLAGS']
      # LINKFLAGS appear to be picked up automatically...
      if not os.path.exists('config.status'):
          cmd = "CFLAGS='%s -DSQLITE_ENABLE_RTREE=1 -fPIC -O3 -DNDEBUG' ./configure --enable-static --disable-shared" % cxxflags
          if Options.platform == 'darwin':
              cmd += ' --disable-dependency-tracking'
          os.system(cmd)
      os.chdir('../../')

      conf.env.append_value("CPPPATH_SQLITE3", ['../deps/%s' % BUNDLED_SQLITE3])
      conf.env.append_value("LINKFLAGS", ['-L../deps/%s/.libs' % BUNDLED_SQLITE3, '-lsqlite3'])

def build_internal_sqlite3(bld):
    if not Options.commands['clean'] and '../deps' in bld.env['CPPPATH_SQLITE3'][0]:
        if not os.path.exists(SQLITE3_TARGET):
            Utils.pprint('RED','Please re-run ./configure or node-waf configure')
            sys.exit()
        os.chdir(SQLITE3_TARGET)
        os.system('make')
        os.chdir('../../')

def clean_internal_sqlite3():
    if os.path.exists(SQLITE3_TARGET):
        rmtree(SQLITE3_TARGET)

def build(bld):
  obj = bld.new_task_gen("cxx", "shlib", "node_addon")
  build_internal_sqlite3(bld)
  obj.cxxflags = ["-g", "-D_FILE_OFFSET_BITS=64", "-D_LARGEFILE_SOURCE",
                  "-DSQLITE_ENABLE_RTREE=1", "-Wall"]
  # uncomment the next line to remove '-undefined dynamic_lookup'
  # in order to review linker errors (v8, libev/eio references can be ignored)
  #obj.env['LINKFLAGS_MACBUNDLE'] = ['-bundle']
  obj.target = TARGET
  obj.source = "src/sqlite3.cc src/database.cc src/statement.cc"
  obj.uselib = "SQLITE3"

def shutdown():
  if Options.commands['clean']:
      if exists(TARGET_FILE):
        unlink(TARGET_FILE)
      clean_internal_sqlite3()
  else:
    if exists(built):
      copy(built, dest)