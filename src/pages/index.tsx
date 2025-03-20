import { Link } from '@heroui/link';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { button as buttonStyles } from '@heroui/theme';

import { title } from '@/components/primitives';
import DefaultLayout from '@/layouts/default';

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title({ color: 'violet' })}>在线工具箱</h1>
          <p className="text-default-500 mt-4">为您提供实用的在线计算工具</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mt-8">
          <Card className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <div className="text-lg font-bold flex items-center">
                  <div className="icon-[mdi--gold] text-amber-500" />{' '}
                  <span className="px-2">黄金计算器</span>
                </div>
                <p className="text-small text-default-500">
                  计算黄金持仓成本和盈利
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex justify-end">
                <Link
                  className={buttonStyles({
                    color: 'primary',
                    variant: 'flat',
                  })}
                  href="/gold-calculator"
                >
                  立即使用
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <div className="text-lg font-bold flex items-center">
                  <div className="icon-[mdi--calculator-variant] text-blue-500" />
                  <span className="px-2">个税计算器</span>
                </div>
                <p className="text-small text-default-500">
                  计算个人所得税及税后收入
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex justify-end">
                <Link
                  className={buttonStyles({
                    color: 'primary',
                    variant: 'flat',
                  })}
                  href="/tax-calculator"
                >
                  立即使用
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
